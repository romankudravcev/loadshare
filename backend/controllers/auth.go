package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/romankudravcev/loadshare/backend/db"
	"github.com/romankudravcev/loadshare/backend/dtos"
	"github.com/romankudravcev/loadshare/backend/models"
)

// Me returns the current user's profile as stored in our database.
// The user record is created automatically on first API call by the Auth middleware.
func Me(c *gin.Context) {
	userID := c.GetUint("userID")
	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, dtos.UserDTO{ID: user.ID, Email: user.Email, Name: user.Name, Hue: user.Hue})
}

// UpdateMe lets the user change their display name and avatar hue (0–359).
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

	db.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates)

	var user models.User
	db.DB.First(&user, userID)
	c.JSON(http.StatusOK, dtos.UserDTO{ID: user.ID, Email: user.Email, Name: user.Name, Hue: user.Hue})
}
