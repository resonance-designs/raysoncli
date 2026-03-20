package cmd

import (
	"fmt"
	"runtime/debug"
)

const Version = "0.1.2"

var (
	Commit    = "unknown"
	BuildDate = "unknown"
)

func init() {
	bi, ok := debug.ReadBuildInfo()
	if !ok {
		return
	}

	for _, s := range bi.Settings {
		switch s.Key {
		case "vcs.revision":
			if s.Value != "" {
				Commit = s.Value
			}
		case "vcs.time":
			if s.Value != "" {
				BuildDate = s.Value
			}
		}
	}
}

func formatShortCommit() string {
	if Commit == "unknown" || len(Commit) <= 7 {
		return Commit
	}

	return fmt.Sprintf("%s...", Commit[:7])
}
