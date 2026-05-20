Dim WshShell
Set WshShell = CreateObject("WScript.Shell")
WshShell.Environment("Process").Item("ELECTRON_RUN_AS_NODE") = ""
WshShell.Environment("Process").Item("ELECTRON_LAUNCHER") = "1"
WshShell.CurrentDirectory = "e:\TRAE SOLO CN"
WshShell.Run """C:\Users\gaofe\nodejs\node-v20.18.0-win-x64\node.exe"" electron\start.cjs", 0, False
