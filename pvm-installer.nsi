!define APPNAME "PVM"
!define EXENAME "pvm.exe"
!define INSTALLDIR "$PROGRAMFILES\\PVM"

Name "${APPNAME}"
OutFile "pvm-installer.exe"
InstallDir "${INSTALLDIR}"
RequestExecutionLevel admin

Var OLD_PATH

Section "Install"
  SetOutPath "$INSTDIR"
  File "${EXENAME}"

  ; Lire PATH actuel
  ReadRegStr $0 HKLM "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" "Path"
  StrCpy $OLD_PATH $0

  ; Vérifie si $INSTDIR est déjà dedans
  Push $0
  Push "$INSTDIR"
  Call IsInPath
  Pop $1
  StrCmp $1 "0" 0 done_addpath

  ; Ajoute $INSTDIR au PATH
  StrCpy $0 "$0;$INSTDIR"
  WriteRegStr HKLM "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" "Path" "$0"

  done_addpath:
    ; Notifie Windows du changement
    System::Call 'Kernel32::SendMessageTimeoutA(i 0xffff, i 0x001A, i 0, t "Environment", i 0, i 1000, *i .r0)'
  ; Écrire le désinstalleur
  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\\${EXENAME}"
  RMDir "$INSTDIR"

  ; Lire PATH
  ReadRegStr $0 HKLM "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" "Path"
  Push $0
  Push "$INSTDIR"
  Call un.RemovePathEntry
  Pop $1
  WriteRegStr HKLM "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" "Path" "$1"

  ; Notifie Windows
  System::Call 'Kernel32::SendMessageTimeoutA(i 0xffff, i 0x001A, i 0, t "Environment", i 0, i 1000, *i .r0)'
SectionEnd

; Vérifie si un chemin est dans PATH
Function IsInPath
  Exch $1 ; chemin à tester
  Exch
  Exch $0 ; PATH complet
  Push $2
  Push $3
  Push $4
  StrCpy $2 "$0;"
  StrCpy $3 "$1;"
  StrCpy $4 "0"
  StrCmp $2 "" is_not_in_path
  StrCmp $2 $3 0 is_not_in_path
  StrCpy $4 "1"
is_not_in_path:
  Pop $4
  Pop $3
  Pop $2
  Exch $4
FunctionEnd

; Retirer un chemin du PATH
Function un.RemovePathEntry
  Exch $1 ; à supprimer
  Exch
  Exch $0 ; PATH complet
  Push $2
  Push $3
  Push $4
  StrCpy $2 ""
  StrCpy $3 "$0;"
loop:
  StrCpy $4 $3 1
  StrCmp $4 ";" split
  StrCmp $3 "" done
  StrCpy $2 "$2$4"
  StrCpy $3 $3 "" 1
  Goto loop
split:
  StrCmp $2 "$1" 0 keep
  StrCpy $2 ""
  Goto skip
keep:
  StrCpy $2 "$2;"
skip:
  StrCpy $3 $3 "" 1
  StrCpy $0 "$0;$2"
  StrCpy $2 ""
  Goto loop
done:
  Pop $4
  Pop $3
  Pop $2
  Exch $0
FunctionEnd
