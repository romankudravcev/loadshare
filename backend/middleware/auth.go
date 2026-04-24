package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/romankudravcev/loadshare/backend/db"
	"github.com/romankudravcev/loadshare/backend/models"
	"github.com/romankudravcev/loadshare/backend/utils"
)

// Auth validates the Supabase Bearer JWT and lazily upserts the user into
// our database on first contact. Sets "userID" and "userEmail" in context.
func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing or malformed Authorization header"})
			return
		}

		claims, err := utils.ValidateSupabaseToken(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}

		// Find or create our local user record keyed by Supabase UUID.
		var user models.User
		if err := db.DB.Where("supabase_id = ?", claims.Sub).First(&user).Error; err != nil {
			name := claims.UserMetadata.FullName
			if name == "" {
				name = claims.Email
			}
			user = models.User{
				SupabaseID: claims.Sub,
				Email:      claims.Email,
				Name:       name,
				Hue:        int([]byte(claims.Sub)[0]) * 53 % 360,
			}
			if err := db.DB.Create(&user).Error; err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to provision user"})
				return
			}
		}

		c.Set("userID", user.ID)
		c.Set("userEmail", user.Email)
		c.Next()
	}
}
