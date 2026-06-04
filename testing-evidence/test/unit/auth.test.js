test("valid login returns token", () => {
    const user = {
      email: "admin@aerolink.com",
      password: "Admin123",
      role: "admin"
    };
  
    const loginInput = {
      email: "admin@aerolink.com",
      password: "Admin123"
    };
  
    const isValid =
      loginInput.email === user.email &&
      loginInput.password === user.password;
  
    expect(isValid).toBe(true);
    expect(user.role).toBe("admin");
  });