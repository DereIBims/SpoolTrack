group "default" { targets = ["filament"] }

target "filament" {
  context   = "."
  tags      = ["dereibims/spooltrack:latest"]
  platforms = ["linux/amd64","linux/arm64"]
}
