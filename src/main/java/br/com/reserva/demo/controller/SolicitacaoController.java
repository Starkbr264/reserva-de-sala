package br.com.reserva.demo.controller;

import br.com.reserva.demo.model.Solicitacao;
import br.com.reserva.demo.service.SolicitacaoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitacoes")
@CrossOrigin
public class SolicitacaoController {

    private final SolicitacaoService service;

    public SolicitacaoController(SolicitacaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Solicitacao> listar(@RequestParam(required = false) Long unidadeId) {
        return service.buscarPorUnidade(unidadeId);
    }

    @PostMapping
    public Solicitacao criar(@RequestBody Solicitacao solicitacao) {
        return service.salvar(solicitacao);
    }

    @PutMapping("/{id}/aprovar")
    public Solicitacao aprovar(@PathVariable Long id) {
        return service.aprovar(id);
    }

    @PutMapping("/{id}/recusar")
    public Solicitacao recusar(@PathVariable Long id) {
        return service.recusar(id);
    }
}