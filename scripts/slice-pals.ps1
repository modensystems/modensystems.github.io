Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class PalSlice {
  public static void MakeTransparent(Bitmap bmp, Color bg, int tol) {
    var rect = new Rectangle(0, 0, bmp.Width, bmp.Height);
    var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    int bytes = Math.Abs(data.Stride) * bmp.Height;
    byte[] buf = new byte[bytes];
    Marshal.Copy(data.Scan0, buf, 0, bytes);
    for (int i = 0; i < bytes; i += 4) {
      byte b = buf[i], g = buf[i+1], r = buf[i+2];
      if (Math.Abs(r - bg.R) <= tol && Math.Abs(g - bg.G) <= tol && Math.Abs(b - bg.B) <= tol) {
        buf[i+3] = 0;
      }
    }
    Marshal.Copy(buf, 0, data.Scan0, bytes);
    bmp.UnlockBits(data);
  }
}
"@

$root = Split-Path $PSScriptRoot -Parent
$src = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'src\assets\59874.jpg'))
$outDir = Join-Path $root 'static\pals'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$cols = 5; $rows = 4
$cw = [int][Math]::Floor($src.Width / $cols)
$ch = [int][Math]::Floor($src.Height / $rows)
$bg = $src.GetPixel(12, 12)
$n = 0
for ($r = 0; $r -lt $rows; $r++) {
  for ($c = 0; $c -lt $cols; $c++) {
    $n++
    $padX = [int]($cw * 0.045)
    $padY = [int]($ch * 0.045)
    $rect = New-Object System.Drawing.Rectangle (($c * $cw) + $padX), (($r * $ch) + $padY), ($cw - 2 * $padX), ($ch - 2 * $padY)
    $crop = $src.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    [PalSlice]::MakeTransparent($crop, $bg, 48)
    $target = 140
    $scaled = New-Object System.Drawing.Bitmap $target, $target
    $g = [System.Drawing.Graphics]::FromImage($scaled)
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($crop, 0, 0, $target, $target)
    $path = Join-Path $outDir ('pal-{0:D2}.png' -f $n)
    $scaled.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $scaled.Dispose(); $crop.Dispose()
    Write-Output $path
  }
}
$src.Dispose()
Write-Output "DONE bg=$($bg.R),$($bg.G),$($bg.B)"
