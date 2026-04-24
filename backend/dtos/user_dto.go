package dtos

type UserDTO struct {
	ID    uint   `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Hue   int    `json:"hue"`
}
