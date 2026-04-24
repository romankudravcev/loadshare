package utils

import (
	"errors"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

// SupabaseClaims mirrors the JWT payload that Supabase issues after OAuth sign-in.
type SupabaseClaims struct {
	Sub          string `json:"sub"`   // Supabase user UUID
	Email        string `json:"email"`
	Role         string `json:"role"`  // "authenticated"
	UserMetadata struct {
		FullName  string `json:"full_name"`
		AvatarURL string `json:"avatar_url"`
	} `json:"user_metadata"`
	jwt.RegisteredClaims
}

// ValidateSupabaseToken verifies a Supabase-issued JWT using SUPABASE_JWT_SECRET.
// The secret is the one shown in Supabase → Project Settings → API → JWT Secret.
func ValidateSupabaseToken(tokenStr string) (*SupabaseClaims, error) {
	secret := os.Getenv("SUPABASE_JWT_SECRET")
	if secret == "" {
		return nil, errors.New("SUPABASE_JWT_SECRET not set")
	}

	token, err := jwt.ParseWithClaims(tokenStr, &SupabaseClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*SupabaseClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}
	return claims, nil
}
