package cmd

import (
	"context"
	"path/filepath"

	"github.com/resonance-designs/rayson/internal/run"
	"github.com/spf13/cobra"
)

func newWSLCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "wsl",
		Short: "WSL and host networking setup scripts",
	}

	startupCmd := &cobra.Command{
		Use:   "startup",
		Short: "Run WSL dev startup script",
		RunE: func(cmd *cobra.Command, args []string) error {
			scriptPath, err := run.ResolveScript(scriptRoot, filepath.Join("wsl-dev-startup", "WSL-Dev-Startup.ps1"))
			if err != nil {
				return err
			}
			return run.Run(context.Background(), run.Options{
				ScriptType: run.PowerShell,
				ScriptPath: scriptPath,
			})
		},
	}

	cmd.AddCommand(startupCmd)
	return cmd
}
