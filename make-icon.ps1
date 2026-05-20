Add-Type -AssemblyName System.Drawing

$sz = 256
$bmp = New-Object System.Drawing.Bitmap($sz, $sz)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)

$mg = 8
$w = $sz - 2 * $mg
$h = $sz - 2 * $mg
$rad = 40

$gp = New-Object System.Drawing.Drawing2D.GraphicsPath
$gp.AddArc($mg, $mg, $rad, $rad, 180, 90)
$gp.AddArc($mg + $w - $rad, $mg, $rad, $rad, 270, 90)
$gp.AddArc($mg + $w - $rad, $mg + $h - $rad, $rad, $rad, 0, 90)
$gp.AddArc($mg, $mg + $h - $rad, $rad, $rad, 90, 90)
$gp.CloseFigure()

$redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 53, 69))
$g.FillPath($redBrush, $gp)

$hdrH = 60
$gpH = New-Object System.Drawing.Drawing2D.GraphicsPath
$gpH.AddArc($mg, $mg, $rad, $rad, 180, 90)
$gpH.AddArc($mg + $w - $rad, $mg, $rad, $rad, 270, 90)
$gpH.AddLine($mg + $w, $mg + $hdrH, $mg, $mg + $hdrH)
$gpH.CloseFigure()
$dkRed = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 30, 40))
$g.FillPath($dkRed, $gpH)

$ringSz = 14
$ringY = $mg + 18
$r1x = $mg + 70
$r2x = $sz - $mg - 70
foreach ($rx in @($r1x, $r2x)) {
    $rl = $rx - 7
    $rt = $ringY - 7
    $g.FillEllipse([System.Drawing.Brushes]::White, $rl, $rt, $ringSz, $ringSz)
    $il = $rx - 3
    $it = $ringY - 3
    $g.FillEllipse($dkRed, $il, $it, 6, 6)
}

$goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 230, 150))
$hdrFont = New-Object System.Drawing.Font("Microsoft YaHei", 20, [System.Drawing.FontStyle]::Bold)
$hdrText = [char]0x8282 + [char]0x5047
$tsz = $g.MeasureString($hdrText, $hdrFont)
$tx = $mg + $w / 2.0 - $tsz.Width / 2.0
$ty = $mg + $hdrH / 2.0 - $tsz.Height / 2.0 - 2
$g.DrawString($hdrText, $hdrFont, $goldBrush, $tx, $ty)

$bodyY = $mg + $hdrH + 10
$bodyH = $sz - 2 * $mg - $hdrH - 10
$bodyX = $mg + 16
$bodyW = $w - 32
$g.FillRectangle([System.Drawing.Brushes]::White, $bodyX, $bodyY, $bodyW, $bodyH)

$dayFont = New-Object System.Drawing.Font("Segoe UI", 72, [System.Drawing.FontStyle]::Bold)
$dayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(50, 50, 50))
$dayText = "15"
$dsz = $g.MeasureString($dayText, $dayFont)
$dx = $mg + $w / 2.0 - $dsz.Width / 2.0
$dy = $bodyY + $bodyH / 2.0 - $dsz.Height / 2.0 + 4
$g.DrawString($dayText, $dayFont, $dayBrush, $dx, $dy)

$smFont = New-Object System.Drawing.Font("Microsoft YaHei", 14, [System.Drawing.FontStyle]::Regular)
$smBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 180, 180))
$mt = "May"
$msz = $g.MeasureString($mt, $smFont)
$mx = $mg + $w / 2.0 - $msz.Width / 2.0
$my = $dy + $dsz.Height - 8
$g.DrawString($mt, $smFont, $smBrush, $mx, $my)

$redBrush.Dispose()
$dkRed.Dispose()
$goldBrush.Dispose()
$dayBrush.Dispose()
$smBrush.Dispose()
$hdrFont.Dispose()
$dayFont.Dispose()
$smFont.Dispose()
$gp.Dispose()
$gpH.Dispose()
$g.Dispose()

$pngPath = "e:\TRAE SOLO CN\public\app-icon.png"
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "PNG created"

$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$icoPath = "e:\TRAE SOLO CN\public\app-icon.ico"
$fs = [System.IO.File]::Create($icoPath)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$bmp.Dispose()
Write-Host "ICO created: $icoPath"

$verify = [System.Drawing.Icon]::New($icoPath)
Write-Host "Verify - Icon loaded: $($verify.Width)x$($verify.Height)"
$verify.Dispose()
