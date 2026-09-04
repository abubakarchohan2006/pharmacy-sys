Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\hanifbhaisys - Copy"

' Start the Next.js dev server hidden (0)
WshShell.Run "npm run dev", 0, False

' Wait a couple of seconds for the server to spin up, then open the browser
WScript.Sleep 2500
WshShell.Run "http://localhost:3000"

Set WshShell = Nothing