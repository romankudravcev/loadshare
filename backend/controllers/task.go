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
		CircleID:  req.CircleID,
		Title:     req.Title,
		Planner:   req.Planner,
		Organizer: req.Organizer,
		Reminder:  req.Reminder,
		Executor:  req.Executor,
		When:      req.When,
		Status:    req.Status,
		Weight:    req.Weight,
		Category:  req.Category,
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
	if req.Planner != nil {
		task.Planner = req.Planner
	}
	if req.Organizer != nil {
		task.Organizer = req.Organizer
	}
	if req.Reminder != nil {
		task.Reminder = req.Reminder
	}
	if req.Executor != nil {
		task.Executor = req.Executor
	}
	if req.When != nil {
		task.When = *req.When
	}
	if req.Status != nil {
		task.Status = *req.Status
	}
	if req.Weight != nil {
		task.Weight = *req.Weight
	}
	if req.Category != nil {
		task.Category = *req.Category
	}

	db.DB.Save(&task)
	c.JSON(http.StatusOK, task)
}
