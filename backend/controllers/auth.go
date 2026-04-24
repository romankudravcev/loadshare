package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jacolate/loadshare/backend/db"
	"github.com/jacolate/loadshare/backend/dtos"
	"github.com/jacolate/loadshare/backend/models"
)

// Login handles Google and Apple login logic
func Login(c *gin.Context) {
	var req dtos.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Verify Apple/Google token and get user email/name
	// Mock user for now
	email := "mock@example.com"
	name := "Mock User"

	var user models.User
	result := db.DB.Where("email = ?", email).First(&user)
	
	if result.Error != nil {
		// Create new user
		user = models.User{
			Email: email,
			Name:  name,
		}
		if req.Provider == "google" {
			user.GoogleID = "mock_google_id"
		} else if req.Provider == "apple" {
			user.AppleID = "mock_apple_id"
		}
		db.DB.Create(&user)
	}

	// TODO: Generate JWT token
	token := "mock_jwt_token"

	c.JSON(http.StatusOK, dtos.AuthResponse{
		Token: token,
		User: dtos.UserDTO{
			ID:    user.ID,
			Email: user.Email,
			Name:  user.Name,
		},
	})
}
