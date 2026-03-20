package run

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

const (
	defaultTimeout = 2 * time.Hour
)

type ScriptType int

const (
	PowerShell ScriptType = iota
	Bash
)

type Options struct {
	ScriptType ScriptType
	WorkDir    string
	ScriptPath string
	Args       []string
}

func CommandFrom(scriptType ScriptType, path string, args []string) *exec.Cmd {
	switch scriptType {
	case Bash:
		fullArgs := append([]string{path}, args...)
		return exec.Command("bash", fullArgs...)
	default:
		psArgs := append([]string{"-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path}, args...)
		return exec.Command("powershell", psArgs...)
	}
}

func ResolveScript(scriptRoot, rel string) (string, error) {
	if filepath.IsAbs(rel) {
		return rel, nil
	}

	candidates := []string{
		filepath.Join(scriptRoot, rel),
		filepath.Join(scriptRoot, "scripts", rel),
		filepath.Join(scriptRoot, "scripts", "scripts", rel),
	}

	for _, candidate := range candidates {
		if candidate != "" {
			if _, err := os.Stat(candidate); err == nil {
				return candidate, nil
			}
		}
	}

	return "", fmt.Errorf("script not found in candidates: %v", candidates)
}

func Run(ctx context.Context, opts Options) error {
	ctx, cancel := context.WithTimeout(ctx, defaultTimeout)
	defer cancel()

	cmd := CommandFrom(opts.ScriptType, opts.ScriptPath, opts.Args)
	if opts.WorkDir != "" {
		cmd.Dir = opts.WorkDir
	}
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	return cmd.Run()
}

