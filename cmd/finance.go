package cmd

import (
	"context"
	"path/filepath"

	"github.com/resonance-designs/rayson/internal/run"
	"github.com/spf13/cobra"
)

func newFinanceCommand() *cobra.Command {
	var (
		inputPath         string
		orderOutputPath   string
		itemOutputPath    string
		smartsheetOutput  string
	)

	cmd := &cobra.Command{
		Use:   "finance",
		Short: "Financial and shopping automation scripts",
	}

	exportCmd := &cobra.Command{
		Use:   "export",
		Short: "Export Shopping_History.md to order/item/Smartsheet CSV files",
		RunE: func(cmd *cobra.Command, args []string) error {
			scriptPath, err := run.ResolveScript(scriptRoot, filepath.Join(finAutomationDir, "Export-ShoppingHistory.ps1"))
			if err != nil {
				return err
			}
			scriptArgs := []string{
				"-InputPath", inputPath,
				"-OrderOutputPath", orderOutputPath,
				"-ItemOutputPath", itemOutputPath,
				"-SmartsheetOutputPath", smartsheetOutput,
			}
			return run.Run(context.Background(), run.Options{
				ScriptType: run.PowerShell,
				ScriptPath: scriptPath,
				Args:       scriptArgs,
			})
		},
	}

	smartsheetCmd := &cobra.Command{
		Use:   "smartsheet",
		Short: "Export only the Smartsheet-friendly CSV from Shopping_History.md",
		RunE: func(cmd *cobra.Command, args []string) error {
			scriptPath, err := run.ResolveScript(scriptRoot, filepath.Join(finAutomationDir, "Export-ShoppingHistory-Smartsheet.ps1"))
			if err != nil {
				return err
			}
			scriptArgs := []string{
				"-InputPath", inputPath,
				"-SmartsheetOutputPath", smartsheetOutput,
			}
			return run.Run(context.Background(), run.Options{
				ScriptType: run.PowerShell,
				ScriptPath: scriptPath,
				Args:       scriptArgs,
			})
		},
	}

	exportCmd.Flags().StringVar(&inputPath, "input", `C:\Temp\Shopping_History.md`, "Input markdown order history file")
	exportCmd.Flags().StringVar(&orderOutputPath, "orders", `C:\Temp\Shopping_History_Orders.csv`, "Output orders CSV")
	exportCmd.Flags().StringVar(&itemOutputPath, "items", `C:\Temp\Shopping_History_Items.csv`, "Output items CSV")
	exportCmd.Flags().StringVar(&smartsheetOutput, "smartsheet", `C:\Temp\Shopping_History_Smartsheet.csv`, "Output Smartsheet CSV")

	smartsheetCmd.Flags().StringVar(&inputPath, "input", `C:\Temp\Shopping_History.md`, "Input markdown order history file")
	smartsheetCmd.Flags().StringVar(&smartsheetOutput, "smartsheet", `C:\Temp\Shopping_History_Smartsheet.csv`, "Output Smartsheet CSV")

	cmd.AddCommand(exportCmd)
	cmd.AddCommand(smartsheetCmd)

	return cmd
}

func init() {
	// Commands are registered in root.go to maintain a central registration point.
}
