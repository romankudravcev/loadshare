package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
)

type GoogleTokenInfo struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Name          string `json:"name"`
	Aud           string `json:"aud"`
	Error         string `json:"error_description"`
}

// VerifyGoogleToken validates an ID token with Google's tokeninfo endpoint
// and returns the user's email and display name.
func VerifyGoogleToken(idToken string) (sub, email, name string, err error) {
	url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)
	resp, err := http.Get(url)
	if err != nil {
		return "", "", "", fmt.Errorf("failed to contact Google: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var info GoogleTokenInfo
	if err := json.Unmarshal(body, &info); err != nil {
		return "", "", "", errors.New("invalid Google token response")
	}
	if info.Error != "" {
		return "", "", "", fmt.Errorf("Google rejected token: %s", info.Error)
	}
	if info.EmailVerified != "true" {
		return "", "", "", errors.New("Google email not verified")
	}

	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	if clientID != "" && info.Aud != clientID {
		return "", "", "", errors.New("Google token audience mismatch")
	}

	return info.Sub, info.Email, info.Name, nil
}
