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
		log.Println("No .env file found, reading from environment")
	}

	for _, key := range []string{"DATABASE_URL", "SUPABASE_JWT_SECRET"} {
		if os.Getenv(key) == "" {
			log.Fatalf("Required env var %s is not set", key)
		}
	}

	db.Connect()

	r := gin.Default()

	// CORS — allow the Expo dev server and any production origin
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api/v1")
	api.Use(middleware.Auth())
	{
		// Profile
		api.GET("/me", controllers.Me)
		api.PATCH("/me", controllers.UpdateMe)

		// Circles (households)
		api.POST("/circles", controllers.CreateCircle)
		api.GET("/circles", controllers.GetCircles)
		api.GET("/circles/:id", controllers.GetCircle)
		api.PATCH("/circles/:id", controllers.UpdateCircle)
		api.DELETE("/circles/:id", controllers.DeleteCircle)

		// Tasks
		api.POST("/tasks", controllers.CreateTask)
		api.GET("/circles/:circle_id/tasks", controllers.GetTasksByCircle)
		api.PATCH("/tasks/:id", controllers.UpdateTask)
		api.DELETE("/tasks/:id", controllers.DeleteTask)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}
