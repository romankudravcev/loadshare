package models

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	CircleID    uint           `gorm:"not null" json:"circle_id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `json:"description"`
	AssignedTo  *uint          `json:"assigned_to"` // User ID
	IsCompleted bool           `default:"false" json:"is_completed"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
