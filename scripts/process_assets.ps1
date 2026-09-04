Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$SourcePath,
        [string]$TargetPath,
        [int]$Width,
        [int]$Height
    )
    $srcImage = [System.Drawing.Image]::FromFile($SourcePath)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $Width, $Height)
    $destImage = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.DrawImage($srcImage, $destRect, 0, 0, $srcImage.Width, $srcImage.Height, [System.Drawing.GraphicsUnit]::Pixel)

    $destImage.Save($TargetPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $graphics.Dispose()
    $destImage.Dispose()
    $srcImage.Dispose()
    Write-Output "Generated: $TargetPath ($Width x $Height)"
}

# Ensure destination directories exist
New-Item -ItemType Directory -Force -Path "public\branding" | Out-Null
New-Item -ItemType Directory -Force -Path "public\splash" | Out-Null
New-Item -ItemType Directory -Force -Path "src\assets\branding" | Out-Null

$assetDir = "doc\AmanauraAsset"

# 1. Favicon & PWA Icons (from Amanaura-favicon.png)
Resize-Image -SourcePath "$assetDir\Amanaura-favicon.png" -TargetPath "public\favicon.png" -Width 64 -Height 64
Resize-Image -SourcePath "$assetDir\Amanaura-favicon.png" -TargetPath "public\apple-touch-icon.png" -Width 180 -Height 180
Resize-Image -SourcePath "$assetDir\Amanaura-favicon.png" -TargetPath "public\icon-192.png" -Width 192 -Height 192
Resize-Image -SourcePath "$assetDir\Amanaura-favicon.png" -TargetPath "public\icon-512.png" -Width 512 -Height 512
Resize-Image -SourcePath "$assetDir\Amanaura-favicon.png" -TargetPath "public\icon-512-maskable.png" -Width 512 -Height 512

# 2. Open Graph Image (1200x630 copy)
Copy-Item -Path "$assetDir\Amanaura OGimage.png" -Destination "public\og-image.png" -Force
Write-Output "Copied: public\og-image.png"

# 3. Splash Screen assets
Copy-Item -Path "$assetDir\Amanaura os-splash.png" -Destination "public\splash\amanaura-splash.png" -Force
Copy-Item -Path "$assetDir\Amanaura os.mp4" -Destination "public\splash\amanaura-os.mp4" -Force
Write-Output "Copied splash assets to public\splash\"

# 4. Brand Logos (using Amanaura os-plain.png as canonical logo)
Copy-Item -Path "$assetDir\Amanaura os-plain.png" -Destination "public\branding\amanaura-logo-plain.png" -Force
Copy-Item -Path "$assetDir\Amanaura os-plain.png" -Destination "public\branding\amanaura-logo-transparent.png" -Force
Copy-Item -Path "$assetDir\Amanaura os-plain.png" -Destination "public\branding\amanaura-logo.png" -Force
Copy-Item -Path "$assetDir\Amanaura os-plain.png" -Destination "src\assets\branding\amanaura-logo-plain.png" -Force
Copy-Item -Path "$assetDir\Amanaura os-plain.png" -Destination "src\assets\branding\amanaura-logo-transparent.png" -Force
Copy-Item -Path "$assetDir\Amanaura os-plain.png" -Destination "src\assets\branding\amanaura-logo.png" -Force
Copy-Item -Path "$assetDir\Amanaura os-3D.png" -Destination "public\branding\amanaura-logo-3d.png" -Force
Copy-Item -Path "$assetDir\Amanaura os-3D.png" -Destination "src\assets\branding\amanaura-logo-3d.png" -Force
Write-Output "Copied branding assets (Amanaura os-plain.png) to public\branding\ and src\assets\branding\"
