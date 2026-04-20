package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
)

const finAutomationDir = "fin-automation"

var (
	scriptRoot string
)

var rootCmd = &cobra.Command{
	Use:   "rayson",
	Short: "RaySon CLI for local automation tasks",
}

func scriptRootCandidates() []string {
	return []string{
		filepath.Join(".", "scripts"),
		filepath.Join(".", "scripts", "scripts"),
	}
}

func isAutomationRoot(dir string) bool {
	_, err := os.Stat(filepath.Join(dir, finAutomationDir))
	return err == nil
}

func detectScriptRoot() string {
	if scriptRoot != "" {
		return scriptRoot
	}

	cwd, _ := os.Getwd()
	cur := cwd
	for i := 0; i < 6; i++ {
		for _, rel := range scriptRootCandidates() {
			if dir := filepath.Join(cur, rel); isAutomationRoot(dir) {
				return dir
			}
		}

		if parent := filepath.Dir(cur); parent != cur {
			cur = parent
		} else {
			break
		}
	}

	return cwd
}

func Execute() {
	scriptRoot = detectScriptRoot()
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().StringVar(&scriptRoot, "script-root", "", "Path to scripts root (defaults to project detection)")

	rootCmd.AddCommand(newFinanceCommand())
	rootCmd.AddCommand(newWSLCommand())
	rootCmd.AddCommand(newMongoCommand())
	rootCmd.AddCommand(newDocManCommand())
	rootCmd.AddCommand(newVersionCommand())
}

func newVersionCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "version",
		Short: "Display version information",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Printf("rayson %s\n", Version)
			fmt.Printf("commit: %s\n", formatShortCommit())
			fmt.Printf("built: %s\n", BuildDate)
		},
	}
}
