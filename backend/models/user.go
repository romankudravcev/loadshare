package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	SupabaseID string         `gorm:"uniqueIndex;not null" json:"supabase_id"`
	Email      string         `gorm:"uniqueIndex;not null" json:"email"`
	Name       string         `json:"name"`
	Hue        int            `gorm:"default:200" json:"hue"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	Circles []Circle `gorm:"many2many:user_circles;" json:"circles,omitempty"`
}
