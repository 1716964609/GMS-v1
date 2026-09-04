# GMS v3.1 Reconstruction Test Results

## 2026-09-04 Fresh Unattended Reconstruction

Result: **PASS**

A completely fresh reconstruction test was performed after destroying the previous test environment.

Verified results:

- Terraform created a fresh EC2 instance, ENI, MySQL EBS volume, and EBS attachment.
- Amazon Linux 2023 was selected from the current AWS SSM public parameter.
- EC2 bootstrap completed automatically through cloud-init without manual repair.
- `cloud-init status` returned `done`.
- The fixed baseline MySQL snapshot was restored to a fresh EBS volume.
- The existing XFS filesystem was detected and mounted at `/var/lib/mysql`.
- MySQL Community packages were installed and verified at version `8.0.44-1.el9`.
- MySQL and Nginx started successfully.
- `tgms.service` was installed but intentionally left inactive by bootstrap because application deployment is reserved for the future GitHub Actions CD workflow.
- The production-identical GMS JAR was deployed manually for this reconstruction test.
- The deployed JAR SHA-256 matched the production baseline:
  `e617220000d5d7cff4eb0515d5f9e3cac008329773ad6934c97e4950e3a06d4f`
- Spring Boot 3.3.3 started successfully on Java 17.
- HikariCP successfully connected to the reconstructed MySQL database.
- Hibernate/JPA initialized successfully.
- Tomcat started on port 8080.
- Nginx successfully proxied to the application.
- Browser access through an SSH tunnel succeeded.
- End-to-end search for `blood` returned terminology data from the reconstructed database, including MedDRA v26 and other archived datasets.
- A final normal `terraform plan` returned:
  `No changes. Your infrastructure matches the configuration.`

## Conclusion

Fresh unattended infrastructure reconstruction and end-to-end GMS application recovery were successfully verified.

The reconstruction test demonstrates that the GMS runtime environment can be rebuilt from Terraform, bootstrap configuration, the fixed database snapshot, and the production application artifact without relying on the original EC2 root filesystem.
