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

## 2026-09-04 EC2 Replacement with Persistent Network and Database

Result: **PASS**

An additional recovery test was performed by forcing replacement of only the test EC2 instance.

Verified behavior:

- The original test EC2 instance was destroyed.
- Terraform created a new EC2 instance.
- The existing test ENI was preserved.
- The private IPv4 address was preserved.
- The IPv6 address was preserved.
- The existing MySQL EBS volume was preserved.
- The MySQL EBS filesystem UUID remained unchanged:
  `208d7a5a-df20-4ae5-822f-8fb8cd468643`
- The preserved MySQL EBS volume was attached to the replacement EC2 instance.
- The replacement EC2 completed cloud-init successfully with `status: done`.
- Bootstrap completed without manual repair.
- MySQL and Nginx started successfully.
- The application JAR was absent from the replacement root filesystem, confirming that the EC2 root filesystem is disposable.
- The production-identical JAR was redeployed manually.
- The deployed JAR SHA-256 matched the production baseline:
  `e617220000d5d7cff4eb0515d5f9e3cac008329773ad6934c97e4950e3a06d4f`
- Spring Boot successfully reconnected to the preserved MySQL database.
- Browser access through the preserved IPv6 address succeeded.
- End-to-end terminology search succeeded after EC2 replacement.

## Replacement Test Conclusion

The test verified the intended recovery model:

- EC2 instance and root filesystem are disposable.
- ENI and network identity are persistent.
- MySQL EBS and database data are persistent.
- A replacement EC2 instance can bootstrap automatically, inherit the existing network identity and database volume, and recover the GMS application after artifact redeployment.
