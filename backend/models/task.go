package models

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CircleID  uint           `gorm:"not null" json:"circle_id"`
	Title     string         `gorm:"not null" json:"title"`
	Planner   *uint          `json:"planner"`
	Organizer *uint          `json:"organizer"`
	Reminder  *uint          `json:"reminder"`
	Executor  *uint          `json:"executor"`
	When      string         `json:"when"`
	Status    string         `json:"status"`
	Weight    int            `json:"weight"`
	Category  string         `json:"category"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
