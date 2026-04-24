package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/romankudravcev/loadshare/backend/db"
	"github.com/romankudravcev/loadshare/backend/dtos"
	"github.com/romankudravcev/loadshare/backend/models"
)

func CreateCircle(c *gin.Context) {
	var req dtos.CreateCircleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ownerID := c.GetUint("userID")
	circle := models.Circle{
		Name:        req.Name,
		Description: req.Description,
		OwnerID:     ownerID,
	}

	if err := db.DB.Create(&circle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create circle"})
		return
	}

	// Auto-add owner as a member
	var owner models.User
	db.DB.First(&owner, ownerID)
	db.DB.Model(&circle).Association("Users").Append(&owner)

	db.DB.Preload("Users").Preload("Owner").First(&circle, circle.ID)
	c.JSON(http.StatusCreated, circle)
}

func GetCircles(c *gin.Context) {
	userID := c.GetUint("userID")
	var circles []models.Circle
	if err := db.DB.
		Preload("Users").
		Preload("Tasks").
		Joins("JOIN user_circles ON user_circles.circle_id = circles.id").
		Where("user_circles.user_id = ?", userID).
		Find(&circles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch circles"})
		return
	}
	c.JSON(http.StatusOK, circles)
}

func GetCircle(c *gin.Context) {
	userID := c.GetUint("userID")
	id := c.Param("id")

	var circle models.Circle
	if err := db.DB.Preload("Users").Preload("Tasks").First(&circle, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "circle not found"})
		return
	}

	// Verify membership
	if !isMember(circle.Users, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "not a member of this circle"})
		return
	}

	c.JSON(http.StatusOK, circle)
}

func UpdateCircle(c *gin.Context) {
	userID := c.GetUint("userID")
	id := c.Param("id")

	var circle models.Circle
	if err := db.DB.First(&circle, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "circle not found"})
		return
	}
	if circle.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the owner can update this circle"})
		return
	}

	var req dtos.UpdateCircleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}

	db.DB.Model(&circle).Updates(updates)
	db.DB.Preload("Users").Preload("Tasks").First(&circle, id)
	c.JSON(http.StatusOK, circle)
}

func DeleteCircle(c *gin.Context) {
	userID := c.GetUint("userID")
	id := c.Param("id")

	var circle models.Circle
	if err := db.DB.First(&circle, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "circle not found"})
		return
	}
	if circle.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the owner can delete this circle"})
		return
	}

	db.DB.Delete(&circle)
	c.JSON(http.StatusOK, gin.H{"message": "circle deleted"})
}

func isMember(users []models.User, userID uint) bool {
	for _, u := range users {
		if u.ID == userID {
			return true
		}
	}
	return false
}
