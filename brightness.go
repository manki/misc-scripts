// Go program to run "screen brightness" commands.

package main

import (
	"exec"
	"fmt"
	"os"
)

const (
	minBrightness = 0x0f
	maxBrightness = 0xff
)

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func brightness() int {
	cmd := exec.Command("setpci", "-s", "00:02.0", "f4.b")
	out, err := cmd.Output()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Running setpci failed: %v\n", err)
		os.Exit(-1)
	}

	var b int
	fmt.Sscanf(string(out), "%x", &b)
	return b
}

func setBrightness(b int) {
	b = max(b, minBrightness)
	b = min(b, maxBrightness)
	cmd := exec.Command("setpci", "-s", "00:02.0", fmt.Sprintf("f4.b=%x", b))
	if err := cmd.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "Running setpci failed: %v\n", err)
		os.Exit(-1)
	}
}

func main() {
	switch len(os.Args) {
	case 1:
		fmt.Println(brightness())
	case 2:
		var delta int
		fmt.Sscanf(os.Args[1], "%d", &delta)
		setBrightness(brightness() + delta)
	default:
		fmt.Fprintf(os.Stderr, "Usage: %s [delta]\n\n", os.Args[0])
		fmt.Fprintln(os.Stderr, "Without arguments prints current brightness level")
		fmt.Fprintln(os.Stderr, "With delta changes brightness")
		fmt.Fprintln(os.Stderr, "brightness 50 increases brightness by 50")
		fmt.Fprintln(os.Stderr, "brightness -50 decreases brightness by 50")
	}
}
