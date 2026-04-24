package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/jacolate/loadshare/backend/controllers"
	"github.com/jacolate/loadshare/backend/db"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	db.Connect()

	r := gin.Default()

	// API Routes
	api := r.Group("/api/v1")
	{
		// Auth
		api.POST("/auth/login", controllers.Login)

		// Circles
		api.POST("/circles", controllers.CreateCircle)
		api.GET("/circles", controllers.GetCircles)
		api.GET("/circles/:id", controllers.GetCircle)

		// Tasks
		api.POST("/tasks", controllers.CreateTask)
		api.GET("/circles/:circle_id/tasks", controllers.GetTasksByCircle)
		api.PUT("/tasks/:id", controllers.UpdateTask)
	}

	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}
