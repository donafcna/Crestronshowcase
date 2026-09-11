// ===== Mode Dev — bascule globale =====
// Pour activer / désactiver le mode Dev par défaut, changer UNIQUEMENT cette
// ligne (true = affiché, false = masqué) puis commit + push.
//
// Ce défaut ne sert que si aucun choix n'a été mémorisé dans le navigateur.
// Sans toucher au code (mémorisé par navigateur) :
//   https://crestrongui.vercel.app/1 → active    /0 → désactive
//   ?dev=1 / ?dev=0 sur n'importe quelle page ; Ctrl + Alt + D ; clic sur le badge.
export const DEV_MODE_DEFAULT = false;
