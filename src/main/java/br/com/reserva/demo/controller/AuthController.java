package br.com.reserva.demo.controller;

import br.com.reserva.demo.model.Usuario;
import br.com.reserva.demo.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody LoginRequest request) {
        Usuario usuario = usuarioService.login(request.email(), request.senha());
        return usuario != null ? ResponseEntity.ok(usuario) : ResponseEntity.badRequest().build();
    }
}

record LoginRequest(String email, String senha) {}