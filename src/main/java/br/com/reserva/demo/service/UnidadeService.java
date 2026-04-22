package br.com.reserva.demo.service;

import br.com.reserva.demo.model.Unidade;
import br.com.reserva.demo.repository.UnidadeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UnidadeService {

    private final UnidadeRepository repository;

    public UnidadeService(UnidadeRepository repository) {
        this.repository = repository;
    }

    public List<Unidade> findAll() {
        return repository.findAll();
    }

    public Unidade findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Unidade não encontrada"));
    }

    public List<Unidade> buscarPorNome(String nome) {
        return repository.findByNomeContainingIgnoreCase(nome);
    }

    public Unidade salvar(Unidade unidade) {
        return repository.save(unidade);
    }

    public Unidade atualizar(Long id, Unidade unidadeAtualizada) {
        Unidade existente = findById(id);
        existente.setNome(unidadeAtualizada.getNome());
        existente.setEndereco(unidadeAtualizada.getEndereco());
        existente.setCep(unidadeAtualizada.getCep());
        existente.setCidade(unidadeAtualizada.getCidade());
        return repository.save(existente);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}