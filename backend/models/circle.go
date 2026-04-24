package models

import (
	"time"

	"gorm.io/gorm"
)

type Circle struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	OwnerID     uint           `gorm:"not null" json:"owner_id"`
	Owner       User           `gorm:"foreignKey:OwnerID" json:"owner"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	Users []User `gorm:"many2many:user_circles;" json:"users,omitempty"`
	Tasks []Task `gorm:"foreignKey:CircleID" json:"tasks,omitempty"`
}
