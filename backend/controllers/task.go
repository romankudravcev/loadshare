package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jacolate/loadshare/backend/db"
	"github.com/jacolate/loadshare/backend/dtos"
	"github.com/jacolate/loadshare/backend/models"
)

func CreateTask(c *gin.Context) {
	var req dtos.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task := models.Task{
		CircleID:    req.CircleID,
		Title:       req.Title,
		Description: req.Description,
		AssignedTo:  req.AssignedTo,
	}

	if err := db.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create task"})
		return
	}

	c.JSON(http.StatusCreated, task)
}

func GetTasksByCircle(c *gin.Context) {
	circleID := c.Param("circle_id")
	var tasks []models.Task
	if err := db.DB.Where("circle_id = ?", circleID).Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks"})
		return
	}
	c.JSON(http.StatusOK, tasks)
}

func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	var task models.Task
	if err := db.DB.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	var req dtos.UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Title != nil {
		task.Title = *req.Title
	}
	if req.Description != nil {
		task.Description = *req.Description
	}
	if req.AssignedTo != nil {
		task.AssignedTo = req.AssignedTo
	}
	if req.IsCompleted != nil {
		task.IsCompleted = *req.IsCompleted
	}

	db.DB.Save(&task)
	c.JSON(http.StatusOK, task)
}
