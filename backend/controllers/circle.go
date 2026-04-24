package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jacolate/loadshare/backend/db"
	"github.com/jacolate/loadshare/backend/dtos"
	"github.com/jacolate/loadshare/backend/models"
)

func CreateCircle(c *gin.Context) {
	var req dtos.CreateCircleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	circle := models.Circle{
		Name:        req.Name,
		Description: req.Description,
		OwnerID:     req.OwnerID,
	}

	if err := db.DB.Create(&circle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create circle"})
		return
	}

	c.JSON(http.StatusCreated, circle)
}

func GetCircles(c *gin.Context) {
	var circles []models.Circle
	if err := db.DB.Preload("Users").Preload("Tasks").Find(&circles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch circles"})
		return
	}
	c.JSON(http.StatusOK, circles)
}

func GetCircle(c *gin.Context) {
	id := c.Param("id")
	var circle models.Circle
	if err := db.DB.Preload("Users").Preload("Tasks").First(&circle, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Circle not found"})
		return
	}
	c.JSON(http.StatusOK, circle)
}
