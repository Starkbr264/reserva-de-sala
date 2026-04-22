package br.com.reserva.demo.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "chaves")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30, unique = true)
    private String codigo;

    @ManyToOne
    @JoinColumn(name = "sala_id", nullable = false)
    @JsonIgnoreProperties({"reservas", "chaves"})
    private Sala sala;

    @Column(length = 30)
    private String andar;

    @Column(length = 20)
    private String status; // disponivel / pega

    @ManyToOne
    @JoinColumn(name = "instrutor_id")
    @JsonIgnoreProperties({"unidade", "senha"})
    private Usuario instrutor;

    @Column(name = "pega_em")
    private LocalDateTime pegaEm;
}