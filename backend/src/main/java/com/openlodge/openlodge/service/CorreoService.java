package com.openlodge.openlodge.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
public class CorreoService {

    private static final Logger log = LoggerFactory.getLogger(CorreoService.class);

    private final JavaMailSender mailSender;
    private final String remitente;
    private final String frontendUrl;

    public CorreoService(JavaMailSender mailSender,
                         @Value("${app.mail.from}") String remitente,
                         @Value("${app.frontend-url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.remitente = remitente;
        this.frontendUrl = frontendUrl;
    }

    // @Async: el registro no se queda esperando al servidor de correo.
    // Si el envio falla solo se loguea; la persona puede pedir que se reenvie.
    @Async
    public void enviarConfirmacionCuenta(String destino, String nombre, String token) {
        String enlace = frontendUrl + "/verificar.html?token=" + token;
        String saludo = HtmlUtils.htmlEscape(nombre);

        String texto = "Hola " + nombre + "!\n\n"
                + "Para activar tu cuenta en AlojAR confirmá tu correo entrando a este link:\n"
                + enlace + "\n\n"
                + "El link vence en 24 horas. Si no creaste la cuenta, ignorá este mensaje.";

        String html = "<div style=\"font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1f3a5f\">"
                + "<h2>¡Hola " + saludo + "!</h2>"
                + "<p>Para activar tu cuenta en <strong>AlojAR</strong> confirmá tu correo:</p>"
                + "<p><a href=\"" + enlace + "\" style=\"display:inline-block;padding:12px 24px;"
                + "background:#ff7a59;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold\">"
                + "Confirmar mi cuenta</a></p>"
                + "<p style=\"font-size:13px;color:#666\">Si el botón no funciona, copiá este link en el navegador:<br>"
                + enlace + "</p>"
                + "<p style=\"font-size:13px;color:#666\">El link vence en 24 horas. "
                + "Si no creaste la cuenta, ignorá este mensaje.</p>"
                + "</div>";

        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(remitente);
            helper.setTo(destino);
            helper.setSubject("Confirmá tu cuenta en AlojAR");
            helper.setText(texto, html);
            mailSender.send(mensaje);
        } catch (Exception e) {
            log.error("No se pudo enviar el correo de confirmación a {}", destino, e);
        }
    }

    @Async
    public void enviarCodigoRecuperacion(String destino, String codigo) {
        String texto = "Pediste recuperar tu contraseña en AlojAR.\n\n"
                + "Tu código es: " + codigo + "\n\n"
                + "Vence en 10 minutos. Si no lo pediste vos, ignorá este mensaje.";

        String html = "<div style=\"font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1f3a5f\">"
                + "<h2>Recuperar contraseña</h2>"
                + "<p>Usá este código en <strong>AlojAR</strong> para elegir una contraseña nueva:</p>"
                + "<p style=\"font-size:32px;font-weight:bold;letter-spacing:8px\">" + codigo + "</p>"
                + "<p style=\"font-size:13px;color:#666\">Vence en 10 minutos. "
                + "Si no lo pediste vos, ignorá este mensaje.</p>"
                + "</div>";

        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(remitente);
            helper.setTo(destino);
            helper.setSubject("Tu código para recuperar la contraseña");
            helper.setText(texto, html);
            mailSender.send(mensaje);
        } catch (Exception e) {
            log.error("No se pudo enviar el código de recuperación a {}", destino, e);
        }
    }
}
