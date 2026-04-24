package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Name      string         `json:"name"`
	GoogleID  string         `gorm:"uniqueIndex" json:"google_id"`
	AppleID   string         `gorm:"uniqueIndex" json:"apple_id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Circles []Circle `gorm:"many2many:user_circles;" json:"circles"`
}
