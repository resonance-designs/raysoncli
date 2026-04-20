package cmd

import (
	"encoding/json"
	"fmt"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/spf13/cobra"
)

type docManStatus struct {
	RepoPath       string            `json:"repoPath"`
	BackendPath    string            `json:"backendPath"`
	ReactPath      string            `json:"reactPath"`
	VuePath        string            `json:"vuePath"`
	Paths          map[string]bool   `json:"paths"`
	Ports          map[string]string `json:"ports"`
	BackendRunning bool              `json:"backendRunning"`
	ReactRunning   bool              `json:"reactRunning"`
	VueRunning     bool              `json:"vueRunning"`
}

func newDocManCommand() *cobra.Command {
	var repoPath string
	var jsonOutput bool

	cmd := &cobra.Command{
		Use:   "docman",
		Short: "Manage local DocMan services",
	}

	cmd.PersistentFlags().StringVar(&repoPath, "repo", `C:\Dev\Projects\docman`, "Path to the DocMan repository")

	statusCmd := &cobra.Command{
		Use:   "status",
		Short: "Show DocMan local service status",
		RunE: func(cmd *cobra.Command, args []string) error {
			status := getDocManStatus(repoPath)
			if jsonOutput {
				encoder := json.NewEncoder(os.Stdout)
				encoder.SetIndent("", "  ")
				return encoder.Encode(status)
			}

			fmt.Printf("DocMan repo: %s\n", status.RepoPath)
			fmt.Printf("backend path: %v\n", status.Paths["backend"])
			fmt.Printf("react frontend path: %v\n", status.Paths["reactFrontend"])
			fmt.Printf("vue frontend path: %v\n", status.Paths["vueFrontend"])
			fmt.Printf("backend :5001: %s\n", status.Ports["backend"])
			fmt.Printf("react frontend :5173: %s\n", status.Ports["reactFrontend"])
			fmt.Printf("vue frontend :5174: %s\n", status.Ports["vueFrontend"])
			return nil
		},
	}
	statusCmd.Flags().BoolVar(&jsonOutput, "json", false, "Emit machine-readable JSON")

	var component string
	var detached bool
	startCmd := &cobra.Command{
		Use:   "start",
		Short: "Start a DocMan service component",
		RunE: func(cmd *cobra.Command, args []string) error {
			return startDocManComponent(repoPath, component, detached)
		},
	}
	startCmd.Flags().StringVar(&component, "component", "vue", "Component to start: backend, react, or vue")
	startCmd.Flags().BoolVar(&detached, "detach", true, "Start in a detached terminal window on Windows")

	var port string
	stopCmd := &cobra.Command{
		Use:   "stop",
		Short: "Stop the process listening on a DocMan port",
		RunE: func(cmd *cobra.Command, args []string) error {
			return stopWindowsPort(port)
		},
	}
	stopCmd.Flags().StringVar(&port, "port", "5174", "Local TCP port to stop")

	cmd.AddCommand(statusCmd)
	cmd.AddCommand(startCmd)
	cmd.AddCommand(stopCmd)
	return cmd
}

func getDocManStatus(repoPath string) docManStatus {
	backendPath := filepath.Join(repoPath, "backend")
	reactPath := filepath.Join(repoPath, "frontend")
	vuePath := filepath.Join(repoPath, "frontend-vue")

	backendPort := probeLocalPort("5001")
	reactPort := probeLocalPort("5173")
	vuePort := probeLocalPort("5174")

	return docManStatus{
		RepoPath:    repoPath,
		BackendPath: backendPath,
		ReactPath:   reactPath,
		VuePath:     vuePath,
		Paths: map[string]bool{
			"repo":          pathExists(repoPath),
			"backend":       pathExists(backendPath),
			"reactFrontend": pathExists(reactPath),
			"vueFrontend":   pathExists(vuePath),
		},
		Ports: map[string]string{
			"backend":       backendPort,
			"reactFrontend": reactPort,
			"vueFrontend":   vuePort,
		},
		BackendRunning: backendPort == "open",
		ReactRunning:   reactPort == "open",
		VueRunning:     vuePort == "open",
	}
}

func pathExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func probeLocalPort(port string) string {
	conn, err := net.DialTimeout("tcp", net.JoinHostPort("127.0.0.1", port), 750*time.Millisecond)
	if err != nil {
		return "closed"
	}
	_ = conn.Close()
	return "open"
}

func startDocManComponent(repoPath string, component string, detached bool) error {
	component = strings.ToLower(component)
	var workDir string
	var npmArgs []string

	switch component {
	case "backend":
		workDir = filepath.Join(repoPath, "backend")
		npmArgs = []string{"run", "dev"}
	case "react":
		workDir = filepath.Join(repoPath, "frontend")
		npmArgs = []string{"run", "dev"}
	case "vue":
		workDir = filepath.Join(repoPath, "frontend-vue")
		npmArgs = []string{"run", "dev"}
	default:
		return fmt.Errorf("unknown DocMan component %q; use backend, react, or vue", component)
	}

	if !pathExists(workDir) {
		return fmt.Errorf("DocMan %s path was not found: %s", component, workDir)
	}

	if detached && runtime.GOOS == "windows" {
		title := fmt.Sprintf("DocMan %s", component)
		args := []string{"/c", "start", title, "cmd", "/k", "npm " + strings.Join(npmArgs, " ")}
		cmd := exec.Command("cmd", args...)
		cmd.Dir = workDir
		return cmd.Start()
	}

	cmd := exec.Command("npm", npmArgs...)
	cmd.Dir = workDir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	return cmd.Run()
}

func stopWindowsPort(port string) error {
	if runtime.GOOS != "windows" {
		return fmt.Errorf("docman stop currently supports Windows only")
	}

	ps := fmt.Sprintf(`$connections = Get-NetTCPConnection -LocalPort %s -State Listen -ErrorAction SilentlyContinue; if (-not $connections) { Write-Host "No listener found on port %s"; exit 0 }; $connections | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force; Write-Host "Stopped process $_ on port %s" }`, port, port, port)
	cmd := exec.Command("powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}
