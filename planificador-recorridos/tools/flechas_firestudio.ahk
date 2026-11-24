; ============================================================
;  Flechas para Fire Studio 7  -  ayudante con AutoHotkey v2
;  Lee el enlaces.csv del Planificador de recorridos y, por cada
;  flecha, escribe posicion, tamano y el salto a la diapositiva.
;
;  Requisitos: AutoHotkey v2 (https://www.autohotkey.com)
;              Fire Studio 7 MAXIMIZADO en la pantalla principal.
;
;  Teclas:
;    F2  = configurar la flecha que acabas de agregar
;    F3  = saltar esta flecha (no hace nada)
;    F4  = volver a la flecha anterior
;    F10 = cerrar el ayudante
; ============================================================
#Requires AutoHotkey v2.0
#SingleInstance Force
CoordMode "Mouse", "Screen"
CoordMode "ToolTip", "Screen"
CoordMode "Pixel", "Screen"
SetKeyDelay 30, 30

; ---------- ajustes (cambiar solo si algo no calza) ----------
PAUSA       := 350   ; ms entre clics. Subir a 600 si el PC va lento
ESCALA_BASE := 100   ; Scale de Fire Studio cuando la flecha mide 100 % en el planificador
PAUSA_CONTADOR := 1200 ; ms que espera a ver si un clic en < > hizo efecto antes de repetirlo
ALPHA       := 128   ; transparencia de la flecha (255 = opaca, 128 = 50 %)

; ---------- posiciones de los botones ----------
; Medidas sobre una pantalla de referencia de 1456 x 819 y escaladas
; a tu pantalla. Fire Studio debe estar maximizado.
BOTONES := Map(
  "edit",        [1298, 356],  ; boton Edit bajo "Window Layers"
  "position",    [106, 665],   ; boton Position (abajo izq.)
  "diffuse",     [106, 637],   ; boton Diffuse Color (abajo izq.)
  "events",      [106, 750],   ; boton Events  (abajo izq.)
  "finish",      [1348, 532],  ; boton Finish Editing
  "posX",        [305, 619],   ; campo Position X
  "posY",        [518, 619],   ; campo Position Y
  "scale",       [944, 619],   ; campo Scale (en Diffuse Color es el campo Alpha)
  "evEnabled",   [239, 566],   ; casilla Event Enabled
  "evClickEnds", [239, 588],   ; casilla Mouse Click Ends Layer
  "evWhenEnds",  [468, 609],   ; casilla When Layer Ends...
  "accionMas",   [838, 609],   ; ">" junto a GoToNext
  "slideMas",    [1037, 609]   ; ">" junto a "Slide: 001"
)

Px(name) {
  global BOTONES
  pt := BOTONES[name]
  return [Round(pt[1] * A_ScreenWidth / 1456), Round(pt[2] * A_ScreenHeight / 819)]
}
Clic(name, veces := 1, espera := 0) {
  global PAUSA
  if !espera
    espera := PAUSA
  p := Px(name)
  MouseMove p[1], p[2]
  Sleep 200        ; Fire Studio necesita "ver" el mouse encima antes del clic
  Loop veces {
    if (A_Index > 1) {            ; mover 1 px entre clics para que no cuente como doble clic
      MouseMove p[1] + Mod(A_Index, 2), p[2]
      Sleep 60
    }
    Click "Down"
    Sleep 80
    Click "Up"
    Sleep espera
  }
}
; --- "huella" de una zona de la pantalla, para saber si algo cambio ---
; zonas en coordenadas de referencia 1456 x 819: [x1, x2, y1, y2]
ZONAS := Map(
  "accionTxt", [700, 826, 603, 615],   ; texto GoToNext / GoPrevious / GoToSlide
  "slideZona", [880, 1052, 603, 615],  ; donde aparece "< Slide: 001 >"
  "slideNum",  [972, 1012, 603, 615]   ; los digitos del numero de diapositiva
)
Huella(zona) {
  global ZONAS
  z := ZONAS[zona], h := ""
  sx := A_ScreenWidth / 1456, sy := A_ScreenHeight / 819
  y := z[3]
  while (y <= z[4]) {
    x := z[1]
    while (x <= z[2]) {
      h .= PixelGetColor(Round(x * sx), Round(y * sy))
      x += 3
    }
    y += 3
  }
  return h
}
; clic que se repite (hasta 4 veces) si la zona indicada no cambia
ClicSeguro(name, zona) {
  global PAUSA_CONTADOR
  antes := Huella(zona)
  Loop 4 {
    Clic(name, 1, 150)
    t := A_TickCount
    while (A_TickCount - t < PAUSA_CONTADOR) {
      if (Huella(zona) != antes) {
        Sleep 350        ; separar del siguiente clic (evita doble clic)
        return true
      }
      Sleep 80
    }
  }
  return false
}

Escribir(name, valor) {
  global PAUSA
  Clic(name)
  Send "^a"
  Sleep 80
  SendText String(valor)
  Sleep 80
  Send "{Enter}"
  Sleep PAUSA
}

; ---------- leer el CSV ----------
archivo := FileSelect(1, A_Desktop, "Elige el enlaces.csv del planificador", "CSV (*.csv)")
if !archivo
  ExitApp
texto := FileRead(archivo, "UTF-8")
flechas := []
for i, linea in StrSplit(texto, "`n", "`r") {
  if (i = 1 || Trim(linea) = "")
    continue
  c := StrSplit(linea, ";")
  for k, v in c
    c[k] := Trim(v, " `"")
  if (c.Length < 9 || c[9] = "")
    continue   ; diapositiva sin flechas o vacante
  flechas.Push({diapo: c[1], nombre: c[2], icono: "NV-" c[5],
                x: c[6] + 0, y: c[7] + 0, tam: c[8] + 0, destino: c[9] + 0, destNombre: c[10]})
}
if !flechas.Length {
  MsgBox "No encontré flechas en ese archivo."
  ExitApp
}
idx := 1
Mostrar()

Mostrar() {
  global flechas, idx
  if (idx > flechas.Length) {
    ToolTip
    MsgBox "¡Listo! Configuraste las " flechas.Length " flechas.`nAhora guarda la simulación en Fire Studio (Save)."
    ExitApp
  }
  f := flechas[idx]
  ToolTip "Flecha " idx " de " flechas.Length "`n"
    . "1) Ve a la diapositiva " f.diapo "  (" f.nombre ")`n"
    . "2) Library > Nav Icons > " f.icono " > Add`n"
    . "3) Clic en la flecha nueva en Window Layers`n"
    . "4) Presiona F2   (va a la diapositiva " f.destino ")`n"
    . "F3 saltar · F4 anterior · F10 salir", Round(A_ScreenWidth*0.16), Round(A_ScreenHeight*0.05)
}

F2:: {
  global flechas, idx, ESCALA_BASE, ALPHA, PAUSA_CONTADOR
  if (idx > flechas.Length)
    return
  f := flechas[idx]
  ToolTip "Configurando flecha " idx "... no muevas el mouse", Round(A_ScreenWidth*0.16), Round(A_ScreenHeight*0.05)
  X := Round(f.x / 100 * 1024)
  Y := Round((100 - f.y) / 100 * 768)   ; en Fire Studio la Y se cuenta desde abajo
  S := Round(f.tam / 100 * ESCALA_BASE)

  Clic("edit")
  Sleep 1200                 ; entrar al modo edicion tarda un poco
  Clic("position")
  Escribir("posX", X)
  Escribir("posY", Y)
  Escribir("scale", S)

  Clic("diffuse")
  Escribir("scale", ALPHA)   ; Alpha esta en el mismo lugar que Scale

  Clic("events")
  Clic("evEnabled")
  Clic("evClickEnds")
  Clic("evWhenEnds")
  Sleep 700                                   ; esperar que aparezcan los controles
  ; avanzar la accion (GoToNext -> GoPrevious -> GoToSlide ...) hasta que
  ; aparezca el selector "Slide: 001"
  sinSlide := Huella("slideZona")
  ok := false
  Loop 8 {
    ClicSeguro("accionMas", "accionTxt")
    Sleep 250
    if (Huella("slideZona") != sinSlide) {
      ok := true
      break
    }
  }
  if !ok {
    MsgBox "No pude dejar la acción en GoToSlide.`nPonla a mano y luego presiona F3 para seguir."
    return
  }
  ; subir el numero desde 001 hasta el destino, comprobando cada clic
  fallos := 0
  Loop f.destino - 1 {
    if !ClicSeguro("slideMas", "slideNum")
      fallos += 1
  }
  if fallos
    MsgBox "Ojo: " fallos " clics no cambiaron el número.`nRevisa que diga Slide " f.destino " antes de seguir."

  Clic("finish")
  Sleep 1800
  idx += 1
  Mostrar()
}
F3:: {
  global idx
  idx += 1
  Mostrar()
}
F4:: {
  global idx
  if (idx > 1)
    idx -= 1
  Mostrar()
}
F10:: ExitApp
