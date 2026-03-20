SHELL := /bin/bash
ROOT_DIR := $(abspath ..)
.RECIPEPREFIX := >

.PHONY: all dist release clean

all: dist

dist:
>cd "$(ROOT_DIR)" && goreleaser release --snapshot --skip=publish --clean --config ./.goreleaser.yaml

release:
>cd "$(ROOT_DIR)" && goreleaser release --clean --config ./.goreleaser.yaml

clean:
>rm -rf "$(ROOT_DIR)/dist"
