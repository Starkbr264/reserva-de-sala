package br.com.reserva.demo.controller;

import br.com.reserva.demo.model.Sala;
import br.com.reserva.demo.service.SalaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salas")
@CrossOrigin
public class SalaController {

    private final SalaService service;

    public SalaController(SalaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Sala> listar(@RequestParam(required = false) Long unidadeId) {
        return unidadeId != null ? service.buscarPorUnidade(unidadeId) : service.findAll();
    }

    @PostMapping
    public Sala criar(@RequestBody Sala sala) {
        return service.salvar(sala);
    }

    @PutMapping("/{id}")
    public Sala atualizar(@PathVariable Long id, @RequestBody Sala sala) {
        return service.atualizar(id, sala);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}