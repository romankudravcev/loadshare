package utils

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

type appleKey struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	Alg string `json:"alg"`
	N   string `json:"n"`
	E   string `json:"e"`
}

type appleJWKS struct {
	Keys []appleKey `json:"keys"`
}

type AppleClaims struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	jwt.RegisteredClaims
}

// VerifyAppleToken validates an Apple identity token using Apple's public JWKS.
// Returns the user's unique subject ID and email.
func VerifyAppleToken(identityToken string) (sub, email string, err error) {
	resp, err := http.Get("https://appleid.apple.com/auth/keys")
	if err != nil {
		return "", "", fmt.Errorf("failed to fetch Apple JWKS: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var jwks appleJWKS
	if err := json.Unmarshal(body, &jwks); err != nil {
		return "", "", errors.New("invalid Apple JWKS response")
	}

	token, err := jwt.ParseWithClaims(identityToken, &AppleClaims{}, func(t *jwt.Token) (any, error) {
		kid, ok := t.Header["kid"].(string)
		if !ok {
			return nil, errors.New("missing kid in Apple token header")
		}

		for _, k := range jwks.Keys {
			if k.Kid != kid {
				continue
			}
			return buildRSAPublicKey(k.N, k.E)
		}
		return nil, fmt.Errorf("no Apple key found for kid=%s", kid)
	})
	if err != nil {
		return "", "", fmt.Errorf("Apple token verification failed: %w", err)
	}

	claims, ok := token.Claims.(*AppleClaims)
	if !ok || !token.Valid {
		return "", "", errors.New("invalid Apple token claims")
	}

	iss, _ := claims.GetIssuer()
	if iss != "https://appleid.apple.com" {
		return "", "", errors.New("Apple token issuer mismatch")
	}

	bundleID := os.Getenv("APPLE_APP_BUNDLE_ID")
	if bundleID != "" {
		aud, _ := claims.GetAudience()
		matched := false
		for _, a := range aud {
			if a == bundleID {
				matched = true
				break
			}
		}
		if !matched {
			return "", "", errors.New("Apple token audience mismatch")
		}
	}

	return claims.Sub, claims.Email, nil
}

func buildRSAPublicKey(nStr, eStr string) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(nStr)
	if err != nil {
		return nil, fmt.Errorf("failed to decode RSA n: %w", err)
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(eStr)
	if err != nil {
		return nil, fmt.Errorf("failed to decode RSA e: %w", err)
	}

	n := new(big.Int).SetBytes(nBytes)
	e := int(new(big.Int).SetBytes(eBytes).Int64())

	return &rsa.PublicKey{N: n, E: e}, nil
}
