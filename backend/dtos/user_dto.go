package dtos

type LoginRequest struct {
	Provider string `json:"provider" binding:"required"` // "google" or "apple"
	Token    string `json:"token" binding:"required"`
	Name     string `json:"name"` // optional display name (used on first Apple sign-in)
}

type AuthResponse struct {
	Token string  `json:"token"`
	User  UserDTO `json:"user"`
}

type UserDTO struct {
	ID    uint   `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Hue   int    `json:"hue"`
}
