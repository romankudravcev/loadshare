package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/romankudravcev/loadshare/backend/db"
	"github.com/romankudravcev/loadshare/backend/dtos"
	"github.com/romankudravcev/loadshare/backend/models"
)

func CreateTask(c *gin.Context) {
	userID := c.GetUint("userID")

	var req dtos.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify caller is a member of the target circle
	var circle models.Circle
	if err := db.DB.Preload("Users").First(&circle, req.CircleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "circle not found"})
		return
	}
	if !isMember(circle.Users, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "not a member of this circle"})
		return
	}

	task := models.Task{
		CircleID:    req.CircleID,
		Title:       req.Title,
		PlannerID:   req.PlannerID,
		OrganizerID: req.OrganizerID,
		ReminderID:  req.ReminderID,
		ExecutorID:  req.ExecutorID,
		When:        req.When,
		Status:      req.Status,
		Weight:      req.Weight,
		Category:    req.Category,
	}

	if err := db.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create task"})
		return
	}

	loadTask(task.ID, c)
}

func GetTasksByCircle(c *gin.Context) {
	userID := c.GetUint("userID")
	circleID := c.Param("circle_id")

	var circle models.Circle
	if err := db.DB.Preload("Users").First(&circle, circleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "circle not found"})
		return
	}
	if !isMember(circle.Users, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "not a member of this circle"})
		return
	}

	var tasks []models.Task
	if err := db.DB.
		Preload("Planner").Preload("Organizer").
		Preload("Reminder").Preload("Executor").
		Where("circle_id = ?", circleID).
		Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch tasks"})
		return
	}
	c.JSON(http.StatusOK, tasks)
}

func UpdateTask(c *gin.Context) {
	userID := c.GetUint("userID")
	id := c.Param("id")

	var task models.Task
	if err := db.DB.Preload("Planner").Preload("Organizer").
		Preload("Reminder").Preload("Executor").First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}

	// Verify membership
	var circle models.Circle
	db.DB.Preload("Users").First(&circle, task.CircleID)
	if !isMember(circle.Users, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "not a member of this circle"})
		return
	}

	var req dtos.UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.PlannerID != nil {
		updates["planner_id"] = req.PlannerID
	}
	if req.OrganizerID != nil {
		updates["organizer_id"] = req.OrganizerID
	}
	if req.ReminderID != nil {
		updates["reminder_id"] = req.ReminderID
	}
	if req.ExecutorID != nil {
		updates["executor_id"] = req.ExecutorID
	}
	if req.When != nil {
		updates["when"] = *req.When
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.Weight != nil {
		updates["weight"] = *req.Weight
	}
	if req.Category != nil {
		updates["category"] = *req.Category
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}

	db.DB.Model(&task).Updates(updates)
	loadTask(task.ID, c)
}

func DeleteTask(c *gin.Context) {
	userID := c.GetUint("userID")
	id := c.Param("id")

	var task models.Task
	if err := db.DB.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}

	var circle models.Circle
	db.DB.Preload("Users").First(&circle, task.CircleID)
	if !isMember(circle.Users, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "not a member of this circle"})
		return
	}

	db.DB.Delete(&task)
	c.JSON(http.StatusOK, gin.H{"message": "task deleted"})
}

// loadTask reloads a task with all associations and writes it to the response.
func loadTask(id uint, c *gin.Context) {
	var task models.Task
	db.DB.Preload("Planner").Preload("Organizer").
		Preload("Reminder").Preload("Executor").
		First(&task, id)
	c.JSON(http.StatusOK, task)
}
