package br.com.reserva.demo.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;

@Entity
@Table(name = "solicitacoes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "instrutor_id", nullable = false)
    @JsonIgnoreProperties({"unidade", "senha"})
    private Usuario instrutor;

    @ManyToOne
    @JoinColumn(name = "sala_id")
    @JsonIgnoreProperties({"reservas", "chaves"})
    private Sala sala;

    private LocalDate data;

    @Column(length = 20)
    private String turno;

    @Column(length = 500)
    private String motivo;

    @Column(length = 20)
    private String status; // pendente / aprovada / recusada

    @ManyToOne
    @JoinColumn(name = "coordenador_id")
    @JsonIgnoreProperties({"unidade", "senha"})
    private Usuario coordenadorResposta;
}