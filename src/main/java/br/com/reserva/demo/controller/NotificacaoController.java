package br.com.reserva.demo.controller;

import br.com.reserva.demo.model.Notificacao;
import br.com.reserva.demo.service.NotificacaoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificacoes")
@CrossOrigin
public class NotificacaoController {

    private final NotificacaoService service;

    public NotificacaoController(NotificacaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notificacao> listar(@RequestParam(required = false) Long usuarioId) {
        return service.buscarPorUsuario(usuarioId);
    }

    @PostMapping
    public Notificacao criar(@RequestBody Notificacao notificacao) {
        return service.salvar(notificacao);
    }

    @PutMapping("/{id}/lida")
    public void marcarComoLida(@PathVariable Long id) {
        service.marcarComoLida(id);
    }
}
