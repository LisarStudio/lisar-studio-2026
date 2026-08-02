import os
import re
import base64

def get_base64_data_uri(file_path):
    if not os.path.exists(file_path):
        print(f"Warning: File not found {file_path}")
        return ""
    ext = os.path.splitext(file_path)[1].lower()
    mime = "image/png"
    if ext in ['.jpg', '.jpeg']:
        mime = "image/jpeg"
    elif ext == '.svg':
        mime = "image/svg+xml"
    elif ext == '.mp3':
        mime = "audio/mpeg"
    
    with open(file_path, 'rb') as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')
    return f"data:{mime};base64,{encoded}"

def main():
    root_dir = r"C:\Users\peter\.gemini\antigravity-ide\scratch\lisar-studio-2026"
    arcade_js_path = os.path.join(root_dir, "assets", "js", "game", "arcade.js")
    
    with open(arcade_js_path, "r", encoding="utf-8") as f:
        arcade_code = f.read()

    # Collect all image files
    img_dir = os.path.join(root_dir, "assets", "img")
    tiling_dir = os.path.join(root_dir, "images", "sprites_arcade")

    asset_map = {}

    def add_asset(rel_path):
        full_path = os.path.normpath(os.path.join(root_dir, rel_path))
        if os.path.exists(full_path):
            uri = get_base64_data_uri(full_path)
            asset_map[rel_path.replace("\\", "/")] = uri
        else:
            print(f"Missing asset: {full_path}")

    # List of known image paths
    for i in range(1, 11):
        add_asset(f"assets/img/spritelisar{i}.png")
        add_asset(f"assets/img/lu{i}.png")
        add_asset(f"assets/img/peter{i}.png")
    
    for i in range(2, 9):
        add_asset(f"assets/img/lisarfly{i}.png")
    
    for i in range(1, 6):
        add_asset(f"assets/img/spritelisaratack{i}.png")
    
    for i in range(1, 9):
        add_asset(f"assets/img/coin_{i}.png")
        add_asset(f"assets/img/ball{i}.png")
        add_asset(f"assets/img/Atack{i}.png")
        add_asset(f"assets/img/atack{i}.png")
    
    for i in range(1, 10):
        add_asset(f"assets/img/flyatack{i}.png")
    
    for i in range(1, 11):
        fn = f"Boost{i}.png" if i >= 7 else f"boost{i}.png"
        add_asset(f"assets/img/{fn}")
    
    for i in range(1, 4):
        add_asset(f"assets/img/enemy{i}.png")
    
    add_asset("assets/img/enemyfire.png")
    add_asset("assets/img/Enemydamage.png")
    add_asset("assets/img/EnemyExplodes.png")
    add_asset("assets/img/shot.png")
    add_asset("assets/img/logo-lisar-studio.png")
    add_asset("images/sprites_arcade/tiling_floor.png")

    print(f"Total base64 assets bundled: {len(asset_map)}")

    # Modify code so image.src uses asset_map lookup
    modified_code = f"""
    const OFFLINE_ASSETS = {repr(asset_map)};
    function resolveOfflineSrc(path) {{
        return OFFLINE_ASSETS[path] || path;
    }}
    """ + arcade_code

    # Replace .src = '...' with .src = resolveOfflineSrc('...')
    modified_code = re.sub(
        r"(\.src\s*=\s*)(['\"]assets/[^'\"]+['\"])",
        r"\1resolveOfflineSrc(\2)",
        modified_code
    )
    modified_code = re.sub(
        r"(\.src\s*=\s*)(['\"]images/[^'\"]+['\"])",
        r"\1resolveOfflineSrc(\2)",
        modified_code
    )
    # Handle dynamic string templates like img.src = `assets/img/${fileName}`;
    modified_code = re.sub(
        r"(\.src\s*=\s*)(`assets/img/[^`]+`)",
        r"\1resolveOfflineSrc(\2)",
        modified_code
    )

    offline_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>LISAR JET RUSH — Modo Offline Movil</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap" rel="stylesheet">
  <style>
    * {{
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }}
    html, body {{
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #05060f;
      color: #ffffff;
      font-family: 'Orbitron', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow: hidden;
    }}
    #game-container {{
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      width: 100%;
      height: 100%;
      background: #000;
    }}
    /* Touch controls on mobile screen */
    .mobile-controls {{
      position: absolute;
      bottom: 20px;
      left: 16px;
      right: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
      pointer-events: none;
    }}
    .touch-btn {{
      pointer-events: auto;
      width: 85px;
      height: 85px;
      border-radius: 50%;
      background: rgba(10, 12, 28, 0.85);
      border: 3px solid #00f3ff;
      box-shadow: 0 0 18px #00f3ff, inset 0 0 10px rgba(0, 243, 255, 0.4);
      color: #ffffff;
      font-family: 'Orbitron', sans-serif;
      font-weight: 900;
      font-size: 0.85rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      active: scale(0.92);
      transition: transform 0.1s ease;
    }}
    .touch-btn:active {{
      transform: scale(0.92);
      background: rgba(0, 243, 255, 0.3);
    }}
    .touch-btn.attack {{
      border-color: #ff0055;
      box-shadow: 0 0 18px #ff0055, inset 0 0 10px rgba(255, 0, 85, 0.4);
    }}
  </style>
</head>
<body>

  <div id="game-container"></div>

  <!-- Controles táctiles optimizados para teléfono móvil -->
  <div class="mobile-controls">
    <div class="touch-btn" id="btn-touch-fly">
      <span style="font-size:1.3rem;">🚀</span>
      <span>VOLAR</span>
    </div>
    <div class="touch-btn attack" id="btn-touch-attack">
      <span style="font-size:1.3rem;">⚔️</span>
      <span>GOLPEAR</span>
    </div>
  </div>

  <script>
    {modified_code}

    document.addEventListener('DOMContentLoaded', () => {{
      const game = new LisarArcade2D('game-container');

      // Vincular botones táctiles de pantalla móvil
      const flyBtn = document.getElementById('btn-touch-fly');
      const attackBtn = document.getElementById('btn-touch-attack');

      if (flyBtn) {{
        flyBtn.addEventListener('touchstart', (e) => {{
          e.preventDefault();
          if (game.state === 'ready' && !game.instructionCardEl) game.startGame();
          game.input.up = true;
        }}, {{ passive: false }});
        flyBtn.addEventListener('touchend', (e) => {{
          e.preventDefault();
          game.input.up = false;
        }}, {{ passive: false }});
        flyBtn.addEventListener('mousedown', () => {{
          if (game.state === 'ready' && !game.instructionCardEl) game.startGame();
          game.input.up = true;
        }});
        flyBtn.addEventListener('mouseup', () => {{
          game.input.up = false;
        }});
      }}

      if (attackBtn) {{
        attackBtn.addEventListener('touchstart', (e) => {{
          e.preventDefault();
          if (game.state === 'ready' && !game.instructionCardEl) game.startGame();
          game.performAttack();
        }}, {{ passive: false }});
        attackBtn.addEventListener('mousedown', () => {{
          if (game.state === 'ready' && !game.instructionCardEl) game.startGame();
          game.performAttack();
        }});
      }}
    }});
  </script>

</body>
</html>
"""

    output_html_path = os.path.join(root_dir, "lisar_jet_rush_offline.html")
    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(offline_html)
    
    print(f"Standalone offline file created successfully: {output_html_path} ({os.path.getsize(output_html_path)} bytes)")

if __name__ == '__main__':
    main()
