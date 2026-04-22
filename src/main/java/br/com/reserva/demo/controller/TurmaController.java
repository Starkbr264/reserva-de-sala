package br.com.reserva.demo.controller;

import br.com.reserva.demo.model.Turma;
import br.com.reserva.demo.service.TurmaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turmas")
@CrossOrigin
public class TurmaController {

    private final TurmaService service;

    public TurmaController(TurmaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Turma> listar(@RequestParam(required = false) Long unidadeId) {
        return unidadeId != null ? service.buscarPorUnidade(unidadeId) : service.findAll();
    }

    @PostMapping
    public Turma criar(@RequestBody Turma turma) {
        return service.salvar(turma);
    }

    @PutMapping("/{id}")
    public Turma atualizar(@PathVariable Long id, @RequestBody Turma turma) {
        return service.atualizar(id, turma);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}