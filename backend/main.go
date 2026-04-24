package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/romankudravcev/loadshare/backend/controllers"
	"github.com/romankudravcev/loadshare/backend/db"
	"github.com/romankudravcev/loadshare/backend/middleware"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	for _, key := range []string{"JWT_SECRET", "DATABASE_URL"} {
		if os.Getenv(key) == "" {
			log.Fatalf("Required environment variable %s is not set", key)
		}
	}
	for _, key := range []string{"GOOGLE_CLIENT_ID", "APPLE_APP_BUNDLE_ID"} {
		if os.Getenv(key) == "" {
			log.Printf("Warning: %s is not set — token audience will not be validated", key)
		}
	}

	db.Connect()

	r := gin.Default()

	api := r.Group("/api/v1")
	{
		// Auth (public)
		api.POST("/auth/login", controllers.Login)

		// Authenticated routes
		auth := api.Group("/")
		auth.Use(middleware.Auth())
		{
			// Current user
			auth.GET("/me", controllers.Me)
			auth.PATCH("/me", controllers.UpdateMe)

			// Circles
			auth.POST("/circles", controllers.CreateCircle)
			auth.GET("/circles", controllers.GetCircles)
			auth.GET("/circles/:id", controllers.GetCircle)
			auth.PATCH("/circles/:id", controllers.UpdateCircle)
			auth.DELETE("/circles/:id", controllers.DeleteCircle)

			// Tasks
			auth.POST("/tasks", controllers.CreateTask)
			auth.GET("/circles/:circle_id/tasks", controllers.GetTasksByCircle)
			auth.PATCH("/tasks/:id", controllers.UpdateTask)
			auth.DELETE("/tasks/:id", controllers.DeleteTask)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}
