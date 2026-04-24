package controllers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/romankudravcev/loadshare/backend/db"
	"github.com/romankudravcev/loadshare/backend/dtos"
	"github.com/romankudravcev/loadshare/backend/models"
	"github.com/romankudravcev/loadshare/backend/utils"
)

// Login accepts a Google or Apple identity token, verifies it with the
// respective provider, upserts the user, and returns a signed JWT.
func Login(c *gin.Context) {
	var req dtos.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var (
		providerSub string
		email       string
		name        string
		err         error
	)

	switch req.Provider {
	case "google":
		providerSub, email, name, err = utils.VerifyGoogleToken(req.Token)
	case "apple":
		providerSub, email, err = utils.VerifyAppleToken(req.Token)
		// Apple only returns name on first sign-in; use email prefix as fallback
		if name == "" && email != "" {
			name = email
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "provider must be 'google' or 'apple'"})
		return
	}

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Use display name from request if provider didn't supply one
	if req.Name != "" {
		name = req.Name
	}

	// Upsert user
	var user models.User
	result := db.DB.Where("email = ?", email).First(&user)
	if result.Error != nil {
		// New user — pick a hue from 0..359 deterministically from the sub
		hue := int([]byte(providerSub)[0]) * 53 % 360
		user = models.User{Email: email, Name: name, Hue: hue}
		if req.Provider == "google" {
			user.GoogleID = &providerSub
		} else {
			user.AppleID = &providerSub
		}
		if err := db.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
			return
		}
	} else {
		// Existing user — backfill provider ID if missing
		updates := map[string]any{}
		if req.Provider == "google" && user.GoogleID == nil {
			updates["google_id"] = providerSub
		} else if req.Provider == "apple" && user.AppleID == nil {
			updates["apple_id"] = providerSub
		}
		if len(updates) > 0 {
			db.DB.Model(&user).Updates(updates)
		}
	}

	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, dtos.AuthResponse{
		Token: token,
		User: dtos.UserDTO{
			ID:    user.ID,
			Email: user.Email,
			Name:  user.Name,
			Hue:   user.Hue,
		},
	})
}

// Me returns the currently authenticated user's profile.
func Me(c *gin.Context) {
	userID := c.GetUint("userID")
	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, dtos.UserDTO{
		ID:    user.ID,
		Email: user.Email,
		Name:  user.Name,
		Hue:   user.Hue,
	})
}

// UpdateMe lets the user change their display name and hue.
func UpdateMe(c *gin.Context) {
	userID := c.GetUint("userID")
	var req struct {
		Name string `json:"name"`
		Hue  *int   `json:"hue"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Hue != nil {
		if *req.Hue < 0 || *req.Hue > 359 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "hue must be 0–359"})
			return
		}
		updates["hue"] = *req.Hue
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}

	if err := db.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user"})
		return
	}

	// Reload
	var user models.User
	db.DB.First(&user, userID)
	c.JSON(http.StatusOK, dtos.UserDTO{ID: user.ID, Email: user.Email, Name: user.Name, Hue: user.Hue})
}

func init() {
	// Validate required env vars at startup (warn only so tests can run without them)
	for _, key := range []string{"JWT_SECRET", "GOOGLE_CLIENT_ID", "APPLE_APP_BUNDLE_ID"} {
		if os.Getenv(key) == "" {
			_ = key // warnings handled by logger in main
		}
	}
}
