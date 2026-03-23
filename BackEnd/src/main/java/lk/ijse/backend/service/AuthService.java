package lk.ijse.backend.service;

import lk.ijse.backend.dto.LoginRequestDTO;
import lk.ijse.backend.dto.RegisterRequestDTO;
import lk.ijse.backend.dto.AuthResponseDTO;

public interface AuthService {
    void register(RegisterRequestDTO request);
    AuthResponseDTO login(LoginRequestDTO request);
}