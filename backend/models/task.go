package models

import (
	"time"

	"gorm.io/gorm"
)

// Weight is 1–5: Quick / Normal / Effort / Heavy / Epic
type Task struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CircleID  uint           `gorm:"not null;index" json:"circle_id"`
	Title     string         `gorm:"not null" json:"title"`
	Weight    int            `gorm:"not null;check:weight >= 1 AND weight <= 5" json:"weight"`
	When      string         `json:"when"`
	Status    string         `gorm:"default:'active'" json:"status"`
	Category  string         `json:"category"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	PlannerID   *uint `json:"planner_id"`
	OrganizerID *uint `json:"organizer_id"`
	ReminderID  *uint `json:"reminder_id"`
	ExecutorID  *uint `json:"executor_id"`

	Planner   *User `gorm:"foreignKey:PlannerID" json:"planner,omitempty"`
	Organizer *User `gorm:"foreignKey:OrganizerID" json:"organizer,omitempty"`
	Reminder  *User `gorm:"foreignKey:ReminderID" json:"reminder,omitempty"`
	Executor  *User `gorm:"foreignKey:ExecutorID" json:"executor,omitempty"`
}
