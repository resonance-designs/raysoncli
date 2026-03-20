package cmd

import (
	"context"
	"path/filepath"

	"github.com/resonance-designs/rayson/internal/run"
	"github.com/spf13/cobra"
)

func newMongoCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "mongo",
		Short: "MongoDB setup scripts",
	}

	sslCmd := &cobra.Command{
		Use:   "ssl-setup",
		Short: "Run MongoDB SSL setup script",
		RunE: func(cmd *cobra.Command, args []string) error {
			scriptPath, err := run.ResolveScript(scriptRoot, filepath.Join("setup-mongodb-ssl", "setup-mongodb-ssl.sh"))
			if err != nil {
				return err
			}
			return run.Run(context.Background(), run.Options{
				ScriptType: run.Bash,
				ScriptPath: scriptPath,
			})
		},
	}

	cmd.AddCommand(sslCmd)
	return cmd
}
