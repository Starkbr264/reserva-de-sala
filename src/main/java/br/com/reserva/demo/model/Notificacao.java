package br.com.reserva.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificacoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String mensagem;

    @Column(length = 50)
    private String paraPerfil;

    private Long paraUsuarioId;

    private Long unidadeId;

    private boolean lida = false;

    @Column(name = "criada_em")
    private LocalDateTime criadaEm = LocalDateTime.now();
}
